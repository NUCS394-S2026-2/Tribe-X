import { Frame } from './components/Frame/Frame';
import { User } from './shared/types/User';

// TODO: Replace with Firestore data once backend is ready
const mockUsers: User[] = [
  {
    uid: 'red-1',
    email: 'c9v3w5@u.northwestern.edu',
    displayName: 'Cai, Wenpeng',
    photoUrl:
      'https://ui-avatars.com/api/?name=Wenpeng+Cai&background=D32F2F&color=FFFFFF',
    team: 'red',
  },
  {
    uid: 'red-2',
    email: 'mercymuiruri2027@u.northwestern.edu',
    displayName: 'Muiruri, Mercy',
    photoUrl:
      'https://ui-avatars.com/api/?name=Mercy+Muiruri&background=D32F2F&color=FFFFFF',
    team: 'red',
  },
  {
    uid: 'red-3',
    email: 'mitchellkaszuba2028@u.northwestern.edu',
    displayName: 'Kaszuba, Mitchell',
    photoUrl:
      'https://ui-avatars.com/api/?name=Mitchell+Kaszuba&background=D32F2F&color=FFFFFF',
    team: 'red',
  },
  {
    uid: 'red-4',
    email: 'lianzheng2026@u.northwestern.edu',
    displayName: 'Zheng, Lian',
    photoUrl:
      'https://ui-avatars.com/api/?name=Lian+Zheng&background=D32F2F&color=FFFFFF',
    team: 'red',
  },
  {
    uid: 'blue-1',
    email: 'christopherridad2027@u.northwestern.edu',
    displayName: 'Ridad, Christopher',
    photoUrl:
      'https://ui-avatars.com/api/?name=Christopher+Ridad&background=1565C0&color=FFFFFF',
    team: 'blue',
  },
  {
    uid: 'blue-2',
    email: 'stanleydu2029@u.northwestern.edu',
    displayName: 'Du, Stanley',
    photoUrl:
      'https://ui-avatars.com/api/?name=Stanley+Du&background=1565C0&color=FFFFFF',
    team: 'blue',
  },
  {
    uid: 'blue-3',
    email: 'valaryanguzuzu2028@u.northwestern.edu',
    displayName: 'Anguzuzu, Valary',
    photoUrl:
      'https://ui-avatars.com/api/?name=Valary+Anguzuzu&background=1565C0&color=FFFFFF',
    team: 'blue',
  },
  {
    uid: 'blue-4',
    email: 'ericoh2027@u.northwestern.edu',
    displayName: 'Oh, Eric',
    photoUrl: 'https://ui-avatars.com/api/?name=Eric+Oh&background=1565C0&color=FFFFFF',
    team: 'blue',
  },
  {
    uid: 'blue-5',
    email: 'coreyzhang2029@u.northwestern.edu',
    displayName: 'Zhang, Corey',
    photoUrl:
      'https://ui-avatars.com/api/?name=Corey+Zhang&background=1565C0&color=FFFFFF',
    team: 'blue',
  },
];

function App(): React.ReactElement {
  return <Frame users={mockUsers} />;
}

export default App;
