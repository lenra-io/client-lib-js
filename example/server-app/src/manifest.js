import { View } from "@lenra/components";
import { views } from "./index.gen.js";
import { DataApi } from "@lenra/app-server";
import { Counter } from "./classes/Counter.js"

export const lenraRoutes = [
    {
        path: "/",
        view: View(views.main)
    }
];

export const jsonRoutes = [
    {
        path: "/global",
        view: View(views.json.counter)
            .data(DataApi.collectionName(Counter), {
                "user": "global"
            })
    },
    {
        path: "/personnal",
        view: View(views.json.counter)
            .data(DataApi.collectionName(Counter), {
                "user": "@me"
            })
    }
];