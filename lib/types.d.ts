import { Router, RequestHandler } from 'express';

declare global {
  interface NodeBBGlobal {
    require<T = any>(request: string): T;
  }

  const nodebb: NodeBBGlobal;

  type NodeBack<T> = (err?: Error | null, ...args: T[]) => void;

  namespace Express {
    export interface Request {
      uid: number;
    }
  }

  interface AppParams {
    router: Router;
    middleware: { admin: { [key: string]: RequestHandler } };
  }

  interface Translation {
    /** language the translation should apply to */
    language: string;
    /** namespace of the translation */
    namespace: string;
    /** translation key */
    key: string;
    /** original text at creation */
    old: string;
    /** replacement text */
    value: string;
  }

  interface Template {
    /** relative path of the template file */
    path: string;
    /** template diff */
    diff: string;
    /** original text at creation */
    old: string;
    /** replacement text */
    value: string;
  }
}
