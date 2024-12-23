// Delay.jsx
import React from "react";
import HDLNode from "../blockHelpers/HDLNode";

const blockConfig = {
  type: "delay",
  name: "Delay",
  description: "Delays input signal by specified number of clock cycles",
  params: {
    DELAY: {
      type: "number",
      default: 1,
      min: 0,
      max: 512,
      description: "Number of clock cycles to delay",
    },
  },
  ports: {
    inputs: {
      in: {
        width: {
          type: "number",
          default: 32,
          min: 1,
          max: 512,
          description: "Input signal width",
        },
        signed: {
          type: "boolean",
          default: false,
          description: "Signed/unsigned input",
        },
        description: "Input signal to delay",
      },
    },
    outputs: {
      out: {
        width: {
          type: "number",
          default: 32,
          min: 1,
          max: 512,
          description: "Output signal width (same as input)",
        },
        signed: {
          type: "boolean",
          default: false,
          description: "Signed/unsigned output (same as input)",
        },
        description: "Delayed output signal",
      },
    },
  },
};

const generateVerilog = (params) => {
  const getPortConfig = (portType, portName) => {
    if (params.ports?.[portType]?.[portName]) {
      return params.ports[portType][portName];
    }
    return {
      width: params.WIDTH || blockConfig.ports.inputs.in.width.default,
      signed: params.SIGNED ?? blockConfig.ports.inputs.in.signed.default,
    };
  };

  const name = params.name || "delay";
  const portIn = getPortConfig("inputs", "in");
  const portOut = getPortConfig("outputs", "out");
  const delay = params.DELAY || blockConfig.params.DELAY.default;

  return `module ${name} #(
    // Port width parameter
    parameter WIDTH = ${portIn.width},
    
    // Delay parameter
    parameter DELAY = ${delay}
)(
    input wire clk,  // Clock signal
    input wire ${portIn.signed ? "signed " : ""}[WIDTH-1:0] in,
    output ${portOut.signed ? "signed " : ""}[WIDTH-1:0] out
);

    // Internal shift register for delay
    reg [WIDTH-1:0] delay_pipe [0:DELAY-1];
    
    generate
        if (DELAY == 0) begin
            // Zero delay case - direct passthrough
            assign out = in;
        end else begin
            // Delayed output
            integer i;
            
            always @(posedge clk) begin
                // First stage takes input
                delay_pipe[0] <= in;
                
                // Shift through delay stages
                for (i = 1; i < DELAY; i = i + 1) begin
                    delay_pipe[i] <= delay_pipe[i-1];
                end
            end
            
            // Connect last stage to output
            assign out = delay_pipe[DELAY-1];
        end
    endgenerate
    
endmodule`;
};

// Helper to generate dynamic config based on port parameters
const createDynamicConfig = (props) => {
  const config = { ...blockConfig };
  const { portParams = {}, blockParams = {} } = props.params || {};

  Object.entries(portParams || {}).forEach(([portName, settings]) => {
    const [portType, portId] = portName.split(".");
    if (config.ports[portType]?.[portId]) {
      config.ports[portType][portId] = {
        ...config.ports[portType][portId],
        ...settings,
      };
    }
  });

  return config;
};

const DelayBlock = (props) => {
  const dynamicConfig = createDynamicConfig(props);

  return (
    <HDLNode
      {...props}
      data={{
        config: dynamicConfig,
        name: props.name,
        params: props.params,
        onParameterChange: props.onParameterChange,
      }}
    />
  );
};

export default DelayBlock;
export { blockConfig, generateVerilog };
