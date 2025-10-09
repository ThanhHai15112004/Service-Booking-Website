import {Request, Response} from "express";

export const SayHello = (req: Request, res: Response) => {
    res.status(200).send("Hello from Express!");
};