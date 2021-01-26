import firebase from "firebase/app";
import "firebase/firestore";

export interface LogFile {
  id: string;
  name: string;
  uploadDate: Date;
}

export const getFiles = async () => {
  const querySnapshot = await firebase.firestore().collection("files").get();
  const files = [] as LogFile[];
  querySnapshot.docs.forEach((docSnapshot) => {
    files.push({
      id: docSnapshot.id,
      name: docSnapshot.data()!.name,
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
