import firebase from "firebase/app";
import "firebase/firestore";

export const getFavorites = async (): Promise<string[]> => {
  const uid = firebase.auth().currentUser?.uid;
  if (!uid) return [];
  const data = (
    await firebase.firestore().collection("users").doc(uid).get()
  ).data();
  return data ? data["favorites"] : [];
};

export const setFavorite = async (
  fileId: string,
  on: boolean
): Promise<void> => {
  const uid = firebase.auth().currentUser?.uid;
  const prev = await getFavorites();
  if (on) {
    prev.push(fileId);
  } else {
    const idx = prev.indexOf(fileId);
    if (idx !== -1) {
      prev.splice(idx, 1);
    }
  }
  await firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .set({ favorites: prev }, { merge: true });
};
