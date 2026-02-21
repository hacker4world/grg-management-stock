import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utilities/bcrypt.util";
import { generateToken, verifyExpiredToken } from "../utilities/jwt.util";
import { compteRepository } from "../repository/repositories";
import { extractToken } from "../middleware";
import {
  AccepterRefuserCompteValidator,
  LoginDto,
  SignupDto,
} from "../dto/authentification.dto";
import { Compte } from "../entity/Compte";
import { fetchCompte } from "../utilities/fetch.util";
import "dotenv/config";
import { Raw } from "typeorm";
import { AuthRequest } from "../middleware";

export class AuthentificationService {
  public async signup(request: Request, response: Response) {
    const data = request.body as SignupDto;

    const existingUser = await compteRepository.findOne({
      where: { nom_utilisateur: data.nom_utilisateur },
    });

    if (existingUser)
      return response.status(400).json({
        message: "Nom d'utilisateur deja existe",
      });

    const newAccount = new Compte();

    newAccount.nom = data.nom;
    newAccount.prenom = data.prenom;
    newAccount.nom_utilisateur = data.nom_utilisateur;
    newAccount.confirme = false;

    newAccount.motdepasse = await hashPassword(data.motdepasse);

    compteRepository
      .save(newAccount)
      .then(() =>
        response.status(200).json({
          message: "Compte est crée",
        }),
      )
      .catch((err) => {
        console.log(err);
        response.status(500).json({
          message: "Un erreur est survenu",
        });
      });
  }

  async login(request: Request, response: Response) {
    console.log("request received");

    const data = request.body as LoginDto;

    const account = await compteRepository.findOne({
      where: { nom_utilisateur: data.nom_utilisateur },
    });

    if (!account)
      return response.status(401).json({
        message: "Nom d'utilisateur ou mot de passe invalide",
      });

    let correct_password = await comparePassword(
      data.motdepasse,
      account.motdepasse,
    );

    if (!correct_password)
      return response.status(401).json({
        message: "Nom d'utilisateur ou mot de passe invalide",
      });

    if (!account.confirme)
      return response.status(401).json({
        message: "Compte n'est pas vérifié",
      });

    let token = generateToken({
      user_id: account.id,
    });

    // Set cookie for web browsers
    response.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    });

    // Also return token in body for mobile apps
    return response.json({
      role: account.role,
      token: token, // For mobile apps
      account: {
        id: account.id,
        nom_utilisateur: account.nom_utilisateur,
        role: account.role,
      },
    });
  }

  public async logout(request: Request, response: Response) {
    response.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    response.json({
      message: "Logout successful",
    });
  }

  public async refreshToken(request: Request, response: Response) {
    const token = extractToken(request);
    if (!token) {
      return response.status(401).json({ message: "Token requis" });
    }

    const result = verifyExpiredToken(token);
    if (!result.success) {
      return response.status(401).json({
        message: "Token invalide ou expiré depuis trop longtemps",
      });
    }

    const compte = await fetchCompte(result.payload.user_id);
    if (!compte || !compte.confirme) {
      return response.status(401).json({ message: "Compte introuvable ou désactivé" });
    }

    const newToken = generateToken({ user_id: compte.id });

    response.cookie("token", newToken, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    });

    return response.json({
      token: newToken,
      account: {
        id: compte.id,
        nom_utilisateur: compte.nom_utilisateur,
        role: compte.role,
      },
    });
  }

  public async verifierCompte(request: Request, response: Response) {
    // authenticate middleware has already set req.user
    const compte = (request as AuthRequest).user!;

    return response.json({
      role: compte.role,
      account: {
        id: compte.id,
        nom: compte.nom,
        prenom: compte.prenom,
        nom_utilisateur: compte.nom_utilisateur,
        role: compte.role,
        confirme: compte.confirme,
      },
    });
  }

  public async accepterCompte(request: Request, response: Response) {
    const data = request.body as AccepterRefuserCompteValidator;

    let compte = await fetchCompte(data.compte_id);

    if (!compte)
      return response.status(404).json({
        message: "Compte n'est pas trouvé",
      });

    if (compte.confirme)
      return response.status(400).json({
        message: "Compte déja accepté",
      });

    compte.confirme = true;

    compte.role = data.role;

    compteRepository
      .save(compte)
      .then(() => {
        response.json({
          message: "Compte est accepté",
        });
      })
      .catch((err) => {
        console.log(err);
        return response.status(500).json({
          message: "Un erreur est survenu",
        });
      });
  }

  public async refuserCompte(request: Request, response: Response) {
    const data = request.body as AccepterRefuserCompteValidator;

    let compte = await fetchCompte(data.compte_id);

    if (!compte)
      return response.status(404).json({
        message: "Compte n'est pas trouvé",
      });

    compteRepository
      .delete(compte)
      .then(() => {
        response.json({
          message: "Compte est supprimé",
        });
      })
      .catch((err) => {
        response.status(500).json({
          message: "Un erreur est survenu",
        });
      });
  }

  public async listeComptes(request: Request, response: Response) {
    const data = request.query;

    /* 1. Read page – default to 1 for normal pagination */
    const rawPage = Number(data.page);
    const page = Number.isNaN(rawPage) ? 1 : rawPage;

    const maxPerPage = Number(process.env.MAX_PER_PAGE);

    /* 2. Build the WHERE clause (filters stay identical) */
    const options: any = { confirme: true };

    if (data.code) options.id = data.code;

    if (data.nom)
      options.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${data.nom}%`,
      });

    if (data.prenom)
      options.prenom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:prenom)`, {
        prenom: `%${data.prenom}%`,
      });

    if (data.nom_utilisateur)
      options.nom_utilisateur = Raw(
        (alias) => `LOWER(${alias}) LIKE LOWER(:nom_utilisateur)`,
        { nom_utilisateur: `%${data.nom_utilisateur}%` },
      );

    if (data.role)
      options.role = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:role)`, {
        role: `%${data.role}%`,
      });

    /* 3. Decide whether to paginate or not */
    const shouldPaginate = page !== 0;

    const findOptions: any = {
      select: {
        id: true,
        nom: true,
        nom_utilisateur: true,
        prenom: true,
        role: true,
        confirme: true,
      },
      where: options,
    };

    if (shouldPaginate) {
      findOptions.skip = (page - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    /* 4. Run the query */
    const [comptes, total] = await compteRepository.findAndCount(findOptions);

    /* 5. Build the response */
    const totalPages = shouldPaginate ? Math.ceil(total / maxPerPage) : 1;

    response.json({
      comptes,
      count: comptes.length,
      totalPages,
      lastPage: shouldPaginate ? page >= totalPages : true,
    });
  }

  public async listeComptesNonAccepté(request: Request, response: Response) {
    const data = request.query;
    const page = data.page !== undefined ? Number(data.page) : 0;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    let options: any = { confirme: false };
    if (data.code) options.id = data.code;
    if (data.nom)
      options.nom = Raw((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${data.nom}%`,
      });
    if (data.prenom)
      options.prenom = Raw((alias) => `Lower(${alias}) LIKE LOWER(:prenom)`, {
        prenom: `%${data.prenom}%`,
      });
    if (data.role)
      options.role = Raw((alias) => `Lower(${alias}) LIKE LOWER(:role)`, {
        role: `%${data.role}%`,
      });

    const findOptions: any = {
      select: {
        id: true,
        nom: true,
        nom_utilisateur: true,
        prenom: true,
        role: true,
        confirme: true,
      },
      where: options,
    };

    if (page !== 0) {
      findOptions.skip = (page - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [comptes, total] = await compteRepository.findAndCount(findOptions);
    const totalPages = page === 0 ? 1 : Math.ceil(total / maxPerPage);

    response.json({
      comptes,
      count: comptes.length,
      totalPages,
      lastPage: page === 0 ? true : page >= totalPages,
    });
  }

  public async deleteCompte(request: Request, response: Response) {
    const { compte_id } = request.query;

    if (!compte_id) {
      return response.status(400).json({
        message: "compte_id est requis",
      });
    }

    try {
      const compte = await fetchCompte(Number(compte_id));

      if (!compte) {
        return response.status(404).json({
          message: "Compte n'est pas trouvé",
        });
      }

      await compteRepository.delete(compte.id);

      return response.json({
        message: "Compte est supprimé",
      });
    } catch (err) {
      console.log(err);
      return response.status(500).json({
        message: "Un erreur est survenu",
      });
    }
  }

  public async updateCompte(request: Request, response: Response) {
    const updateData = request.body;

    if (!updateData.code_compte) {
      return response.status(400).json({
        message: "compte_id est requis",
      });
    }

    try {
      const compte = await fetchCompte(Number(updateData.code_compte));

      if (!compte) {
        return response.status(404).json({
          message: "Compte n'est pas trouvé",
        });
      }

      if (!compte.confirme) {
        return response.status(400).json({
          message: "Compte n'est pas confirmé",
        });
      }

      // Update only allowed fields
      if (updateData.nom) compte.nom = updateData.nom;
      if (updateData.prenom) compte.prenom = updateData.prenom;
      if (updateData.nomUtilisateur)
        compte.nom_utilisateur = updateData.nomUtilisateur;
      if (updateData.role) compte.role = updateData.role;

      await compteRepository.save(compte);

      return response.json({
        message: "Compte est modifié",
        compte: {
          id: compte.id,
          nom: compte.nom,
          prenom: compte.prenom,
          nom_utilisateur: compte.nom_utilisateur,
          role: compte.role,
          confirme: compte.confirme,
        },
      });
    } catch (err) {
      console.log(err);
      return response.status(500).json({
        message: "Un erreur est survenu",
      });
    }
  }
}
