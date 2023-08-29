
/**
 * 
 * @param {import("../classes/Counter").Counter[]} param0 
 * @param {import("@lenra/app-server").props} param1 
 * @returns 
 */
export default function ([counter]) {
    return {
        value: counter.count,
        increment: {
            type: "listener",
            action: "increment",
            props: {
                id: counter._id
            }
        }
    };
}

