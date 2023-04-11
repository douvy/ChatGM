import { Conversation, Message, Feature } from '../interfaces';
import Home from '../components/Home';

interface Session {
  user: {
    username: String,
    _id?: String,
  }
  _id?: String
}

interface PageProps {
  session: any,
  conversations: Conversation[],
  starredMessages: Message[],
  features?: Feature[],
  tasks?: any[],
  userInfo: any,
  activeTask: any,
  c: any,
}

export default Home;
