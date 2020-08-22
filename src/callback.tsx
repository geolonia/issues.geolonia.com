import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import qs from "qs";

type OwnProps = {
  requestAccessToken: (code: string) => Promise<void>;
};
type RouterProps = {};
type Props = OwnProps & RouterProps;

const Callback = (props: Props) => {
  const { requestAccessToken } = props;
  const location = useLocation();
  const history = useHistory();
  const { code } = qs.parse(location.search.replace(/^\?/, ""));
  const [onceLoaded, setOnceLoaded] = React.useState(false);

  React.useEffect(() => {
    if (code && typeof code === "string" && !onceLoaded) {
      setOnceLoaded(true);
      requestAccessToken(code).finally(() => history.replace("/"));
    }
  }, [code, history, onceLoaded, requestAccessToken]);
  return null;
};

export default Callback;
