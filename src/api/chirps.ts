import type { Request, Response } from "express";

export function handlerChirpsValidate(req: Request, res: Response) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const parsedBody = JSON.parse(body);

      if (parsedBody.body.length > 140) {
        res.status(400).json({
          error: "Chirp is too long",
        });
        return;
      }
      res.status(200).json({
        valid: true,
      });
    } catch {
      res.status(400).json({
        error: "Something went wrong",
      });
    }
  });
}
