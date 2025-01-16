import { jsx as _jsx } from "react/jsx-runtime";
const COLORS = {
    I: "#00f0f0",
    T: "#a000f0",
    O: "#f0f000",
    L: "#f0a000",
    Z: "#f00000",
    null: "#444", // Couleur par défaut pour les blocs vides
};
const Block = ({ color }) => {
    const blockStyle = {
        backgroundColor: COLORS[color || "null"], // Détermine la couleur selon la clé ou utilise la couleur par défaut
        border: "1px solid #000", // Bordure des blocs
    };
    return _jsx("div", { className: "block", style: blockStyle });
};
export default Block;
