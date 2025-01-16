import React from "react";

interface BlockProps {
  color: string | null; // La couleur du bloc ou null s'il est vide
}

const COLORS: Record<string, string> = {
  I: "#00f0f0",
  T: "#a000f0",
  O: "#f0f000",
  L: "#f0a000",
  Z: "#f00000",
  null: "#444", // Couleur par défaut pour les blocs vides
};

const Block = ({ color }: BlockProps) => {
  const blockStyle = {
    backgroundColor: COLORS[color || "null"], // Détermine la couleur selon la clé ou utilise la couleur par défaut
    border: "1px solid #000", // Bordure des blocs
  };

  return <div className="block" style={blockStyle}></div>;
};

export default Block;