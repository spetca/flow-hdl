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
      {mainParam && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-gray-500">
            {mainParam.value}
          </div>
        </div>
      )}

      {Object.keys(config.params || {}).length > 0 && (
        <div className="text-xs bg-gray-50 px-3 py-1 text-gray-600 border-b border-gray-200">
          {Object.entries(config.params)
            .map(([name, param]) => `${name}: ${param.default}`)
            .join(", ")}
        </div>
      )}
    </>
  );
};
