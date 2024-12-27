// components/flowgraph/NodeParameters.jsx
export const NodeParameters = ({ config }) => {
  const getMainParameter = () => {
    if (!config.params) return null;

    const paramMap = {
      delay: "DELAY",
      adder: "DELAY_OUT",
    };

    const mainParamKey = paramMap[config.type];
    if (!mainParamKey) return null;

    const param = config.params[mainParamKey];
    return param ? { name: mainParamKey, value: param.default } : null;
  };

  const mainParam = getMainParameter();

  return (
    <>
      {Object.keys(config.params || {}).length > 0 && (
        <div className="text-xs bg-gray-50 px-1 py-1 text-blue-700 border-b border-gray-500">
          {Object.entries(config.params)
            .map(([name, param]) => `${name}: ${param.default}`)
            .join(", ")}
        </div>
      )}
    </>
  );
};
