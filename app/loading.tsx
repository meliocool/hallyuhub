import { PuffLoader } from "react-spinners";

const LoadingPage = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
      }}
    >
      <PuffLoader
        color={"#f4b400"}
        loading={true}
        size={150}
        aria-label="Loading Spinner"
      />
    </div>
  );
};

export default LoadingPage;
