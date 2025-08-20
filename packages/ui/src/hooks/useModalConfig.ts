import { useContext } from "react";
import { laserEyesModalContext } from "../providers/LaserEyesModalContext";


export default function useModalConfig() {
  const context = useContext(laserEyesModalContext)
  return context.config
}