"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = require("bcrypt");
const hashPassword = async (password) => {
    const salt = await (0, bcrypt_1.genSalt)(10);
    return (0, bcrypt_1.hash)(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = (password, correctPassword) => {
    return (0, bcrypt_1.compare)(password, correctPassword);
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=bcrypt.util.js.map