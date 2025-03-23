import FileInput from "./FileInput";
import { PIPPlayer } from "./PIPPlayer";

const App = () => {
  return (
    <section className="h-screen flex flex-col justify-center items-center gradient-bg gap-y-4">
      <FileInput />
      <PIPPlayer />
    </section>
  );
};

export default App;
