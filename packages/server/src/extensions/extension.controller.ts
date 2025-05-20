import { Request, Response, Router } from 'express';
import { extensionService } from './extension.service';
import { ExtensionMarket } from '@/models/extension.model';

export const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const extensions = await extensionService.getAll();

    const extensionsSanitized = extensions.map((extension) =>
      extensionService.sanitizeMarket(extension as ExtensionMarket),
    );

    res.status(200).json(extensionsSanitized);
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong..');
  }
});

export const extensionController = router;
