import { NextFunction, Request, Response, Router } from 'express';
import { NotesService } from './notes.service';

const router = Router({ mergeParams: true });

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const notes = await NotesService.getAllNotesByUserId(userId);

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:noteId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const noteId = +req.params.noteId;

      const note = await NotesService.getNoteById(noteId, userId);

      res.status(200).json(note);
    } catch (error) {
      next(error);
    }
  },
);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const {
      title,
      content,
      projectId,
    }: {
      title: string;
      content: string;
      projectId: number;
    } = req.body;

    const note = await NotesService.createNote({
      title,
      content,
      projectId,
      userId: userId,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:noteId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const noteId = +req.params.noteId;
      const {
        title,
        content,
        projectId,
      }: {
        title: string;
        content: string;
        projectId: number;
      } = req.body;

      const note = await NotesService.updateNote(noteId, {
        title,
        content,
        projectId,
        userId,
      });

      res.status(200).json(note);
    } catch (error) {
      next(error);
    }
  },
);

export const notesRouter = router;
