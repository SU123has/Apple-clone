import { Html } from "@react-three/drei";
import React from "react";
import { Spinner } from "flowbite-react";

const Loading = () => {
  return (
    <Html>
      <Spinner aria-label="Loader" size="xl" color="purple" />
    </Html>
  );
};

export default Loading;
