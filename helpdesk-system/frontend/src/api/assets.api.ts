import api from "./client";

export const getAssets = () => {
    return api.get("/assets");
};

export const createAsset = (
    data: unknown
) => {
    return api.post(
        "/assets",
        data
    );
};

export const updateAsset = (
    assetId: number,
    data: unknown
) => {
    return api.patch(
        `/assets/${assetId}`,
        data
    );
};