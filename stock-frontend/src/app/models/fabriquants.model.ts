export interface FabriquantModel {
  code: string;
  nom: string;
  adresse: string;
  contact: string;
}
export interface FabriquantListResponse {
  fabriquants: FabriquantModel[];
  lastPage: boolean;
}
export interface ModifierFabriquant {
  code_fabriquant: string;
  nom: string;
  adresse: string;
  contact: string;
}
/* NEW */
export interface CreateFabriquantModel {
  nom: string;
  adresse: string;
  contact: string;
}
