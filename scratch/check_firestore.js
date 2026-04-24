import { db } from './src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function listComponents() {
  try {
    const querySnapshot = await getDocs(collection(db, 'components'));
    console.log("--- FIRESTORE COMPONENTS ---");
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data());
    });
    console.log("----------------------------");
  } catch (e) {
    console.error("Error listing components: ", e);
  }
}

listComponents();
