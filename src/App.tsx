import FileInput from "./FileInput";
import { FileSidebar } from "./FileSidebar";
import { PIPPlayer } from "./PIPPlayer";

const App = () => {
  return (
    <main className="flex h-screen">
      <FileSidebar />
      <section className="flex-1 flex flex-col justify-center items-center gradient-bg gap-y-4">
        <FileInput />
        <PIPPlayer />
      </section>
    </main>
  );
};

export default App;
