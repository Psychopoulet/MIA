import type ContainerPattern from "node-containerpattern";
export interface iLogger {
    "critical": (content: string) => void;
    "error": (content: string) => void;
    "warning": (content: string) => void;
    "success": (content: string) => void;
    "info": (content: string) => void;
    "debug": (content: string) => void;
}
export default function generateLogger(container: ContainerPattern): void;
