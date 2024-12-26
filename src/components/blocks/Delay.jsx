// Delay.jsx
import { createBlock } from "../blockHelpers/BlockFactory";

const config = {
  name: "Delay",
  description: "Delays input signal by specified number of clock cycles",
  synchronous: true,
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
        width: { default: 32, min: 1, max: 512 },
        signed: false,
        description: "Input signal to delay",
      },
    },
    outputs: {
      out: {
        width: { default: 32, min: 1, max: 512 },
        signed: false,
        description: "Delayed output signal",
      },
    },
  },
};

const generateVerilog = ({ name = "delay", ports, params }) => {
  const portIn = ports?.inputs?.in || { width: 32, signed: false };
  const portOut = ports?.outputs?.out || { width: 32, signed: false };
  const delay = params?.DELAY || config.params.DELAY.default;

  return `module ${name} #(
    // Port width parameter
    parameter WIDTH = ${portIn.width},
    
    // Delay parameter
    parameter DELAY = ${delay}
)(
    input wire clk,
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

export default createBlock({ config, generateVerilog });
