const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

const addUser = async (username, password) => {
  let processedUsername = username.toLowerCase();
  await prisma.user.create({
    data: {
      name: processedUsername,
      password: password,
    },
  });
};
const createFolder = async (folderName, userId) => {
  const processedUserId = parseInt(userId);
  const processedFolderName = folderName.toLowerCase();
  await prisma.folder.create({
    data: {
      name: processedFolderName,
      userId: processedUserId,
    },
  });
};
const editFolder = async (folderName, folderId) => {
  let processedFolderName = folderName.toLowerCase();
  let processedFolderId = parseInt(folderId);
  await prisma.folder.update({
    where: {
      id: processedFolderId,
    },
    data: {
      name: processedFolderName,
    },
  });
};
const getFolder = async (folderId) => {
  const processedFolderId = parseInt(folderId);
  const result = await prisma.folder.findUnique({
    where: {
      id: processedFolderId,
    },
    include: {
      files: true,
    },
  });
  return result;
};
const addFile = async (filename, folderId, path) => {
  const processedFileName = filename.toLowerCase();
  const processedFolderId = parseInt(folderId);
  await prisma.file.create({
    data: {
      name: processedFileName,
      path: path,
      folderId: processedFolderId,
    },
  });
};
const getFile = async (fileId) => {
  const processedFileId = parseInt(fileId);
  const result = await prisma.file.findUnique({
    where: {
      id: processedFileId,
    },
  });
  return result;
};

const deleteFile = async (fileId) => {
  const processedFileId = parseInt(fileId);
  const file = await prisma.file.delete({
    where: {
      id: processedFileId,
    },
  });
  fs.unlink(file.path, (err) => {
    if (err) {
      console.err(err);
    }
  });
  return file;
};

const deleteFolder = async (folderId) => {
  let processedFolderId = parseInt(folderId);
  let folder = await prisma.folder.findFirst({
    where: {
      id: processedFolderId,
    },
    select: {
      files: true,
    },
  });
  let files = folder.files;
  await prisma.file.deleteMany({
    where: {
      folderId: processedFolderId,
    },
  });
  await prisma.folder.delete({
    where: {
      id: processedFolderId,
    },
  });
  files.forEach((file) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
};

module.exports = {
  addUser,
  createFolder,
  editFolder,
  getFolder,
  addFile,
  getFile,
  deleteFile,
  deleteFolder,
};
