import InPortBlock from "../blocks/InPort.jsx";
import OutPortBlock from "../blocks/OutPort.jsx";
import DelayBlock from "../blocks/Delay.jsx";
import AdderBlock from "../blocks/Adder.jsx";
import MultiplierBlock from "../blocks/Multiplier.jsx";
import SubflowBlock from "../blocks/Subflow.jsx";

// Block type constants
export const BlockTypes = {
    PRIMITIVE: "primitive",
    INPORT: "inport",
    OUTPORT: "outport",
    SUBFLOW: "subflow", // Add new type
};

// Registry of all available blocks
class BlockRegistry {
    constructor() {
        this.registry = {};
    }

    add(key, component, type) {
        if(this.registry[key]) {
            console.error('Block already added to registry.');
            return;
        }

        this.registry[key] = {
            type: type,
            component: component,
            config: component.blockConfig,
            generateVerilog: component.generateVerilog,
        };
    }

    get(key) {
        if(!this.registry[key]) {
            console.error(`Registry does not contain ${key} block.`);
            return null;
        }

        return this.registry[key];
    }
}

const registry = new BlockRegistry();

registry.add( 'inport', InPortBlock, BlockTypes.INPORT );
registry.add( 'outport', OutPortBlock, BlockTypes.OUTPORT );

registry.add( 'adder', AdderBlock, BlockTypes.PRIMITIVE );
registry.add( 'delay', DelayBlock, BlockTypes.PRIMITIVE );
registry.add( 'multiplier', MultiplierBlock, BlockTypes.PRIMITIVE );
registry.add( 'subflow', SubflowBlock, BlockTypes.PRIMITIVE );

console.log("blockRegistry created:", registry);

export default registry;