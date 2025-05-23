declare module "*.module.css";

interface Document {
  addEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    useCapture?: boolean
  ): void;
}
