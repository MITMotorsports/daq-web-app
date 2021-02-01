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
    files.push({
      id: docSnapshot.id,
      name: docSnapshot.data().name,
      columns: columns,
      uploadDate: (docSnapshot.data()!
        .uploaded as firebase.firestore.Timestamp).toDate(),
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
