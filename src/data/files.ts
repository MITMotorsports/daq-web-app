import firebase from "firebase/app";
import "firebase/firestore";

const dataTypes: {
  [key: string]: {
    message: string;
    field: string;
    scaling_factor: number;
    unit: string;
    alias: string;
  };
} = require("../data_types.json");

export type ColumnInfo = {
  message: string;
  field: string;
  alias: string;
  unit: string;
  scale_factor: number;
};
export interface LogFile {
  id: string;
  name: string;
  columns: ColumnInfo[];
  uploadDate: Date;
  metadata: FileMetadata;
}
export interface FileMetadata {
  chassis?: string;
  location?: string;
  activity?: string;
  testNum?: string;
  notes?: string;
}

export const getFiles = async () => {
  const querySnapshot = await firebase.firestore().collection("files").get();
  const files = [] as LogFile[];
  querySnapshot.docs.forEach((docSnapshot) => {
    const messageNames: string[] = docSnapshot.data().columns ?? [];
    const columns: ColumnInfo[] = [];
    for (const messageName of messageNames) {
      for (const [, value] of Object.entries(dataTypes)) {
        if (value.message === messageName) {
          columns.push({
            message: value.message,
            field: value.field,
            alias: value.alias,
            unit: value.unit,
            scale_factor: value.scaling_factor,
          });
        }
      }
    }
    columns.sort((a, b) =>
      a.message.concat(a.field) > b.message.concat(b.field) ? 1 : -1
    );
    const docData = docSnapshot.data();
    files.push({
      id: docSnapshot.id,
      name: docData.name,
      columns: columns,
      uploadDate: (docSnapshot.data()!
        .uploaded as firebase.firestore.Timestamp).toDate(),
      metadata: docData.metadata,
    });
  });
  return files;
};

export const getDownloadUrlForFile = async (
  fileId: string,
  name: string
): Promise<string> =>
  firebase.storage().ref(`prototype/${fileId}/${name}`).getDownloadURL();

export const getDownloadUrlForPath = async (path: string): Promise<string> =>
  firebase.storage().ref(path).getDownloadURL();

export const setFileMetadata = (file: LogFile, metadata: FileMetadata): Promise<void> => firebase.firestore().collection("files").doc(file.id).update({metadata: metadata})
