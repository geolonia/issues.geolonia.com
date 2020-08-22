import React from "react";

type OwnProps = {
  setCode: (code: string) => void;
};
type RouterProps = {};
type Props = OwnProps & RouterProps;

const Callback = (props: Props) => {
  React.useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const code = urlSearchParams.get("code");
    if (code) {
      props.setCode(code);
    }
  });
  return null;
};

export default Callback;
