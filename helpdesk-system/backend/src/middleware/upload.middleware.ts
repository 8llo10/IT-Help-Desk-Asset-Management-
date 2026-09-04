import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================================================
   UPLOAD DIRECTORY
   ========================================================= */

const uploadDirectory =
    path.resolve(
        process.cwd(),
        "uploads",
        "tickets"
    );

if (
    !fs.existsSync(
        uploadDirectory
    )
) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true,
        }
    );
}

/* =========================================================
   STORAGE
   ========================================================= */

const storage =
    multer.diskStorage({
        destination: (
            req,
            file,
            cb
        ) => {
            cb(
                null,
                uploadDirectory
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {
            const extension =
                path.extname(
                    file.originalname
                );

            const baseName =
                path
                    .basename(
                        file.originalname,
                        extension
                    )
                    .replace(
                        /[^a-zA-Z0-9-_]/g,
                        "-"
                    )
                    .slice(0, 80);

            const uniqueName =
                `${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}-${baseName}${extension}`;

            cb(
                null,
                uniqueName
            );
        },
    });

/* =========================================================
   ALLOWED FILE TYPES
   ========================================================= */

const allowedMimeTypes =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp",

        "application/pdf",

        "text/plain",

        "application/json",
    ]);

/* =========================================================
   FILE FILTER
   ========================================================= */

const fileFilter: multer.Options["fileFilter"] =
    (
        req,
        file,
        cb
    ) => {
        if (
            !allowedMimeTypes.has(
                file.mimetype
            )
        ) {
            return cb(
                new Error(
                    "INVALID_FILE_TYPE"
                )
            );
        }

        cb(
            null,
            true
        );
    };

/* =========================================================
   MULTER INSTANCE
   ========================================================= */

export const ticketUpload =
    multer({
        storage,

        fileFilter,

        limits: {
            fileSize:
                10 * 1024 * 1024,

            files: 5,
        },
    });