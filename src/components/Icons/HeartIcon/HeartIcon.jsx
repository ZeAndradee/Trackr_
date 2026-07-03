import React, { Suspense, lazy } from 'react';
import DefaultLike from './Variants/DefaultLike/DefaultLike';

const EspressoLike = lazy(() => import('./Variants/EspressoLike/EspressoLike'));
const BadBunnyLike = lazy(() => import('./Variants/BadBunnyLike/BadBunnyLike'));

const getSpecificLikeComponent = (track) => {
    const name = track?.name;
    const artistName = track?.artists?.[0]?.name;
    if (!track || !name || !artistName) return DefaultLike;

    const artistString = artistName.trim().toLowerCase();
    const titleString = name.trim().toLowerCase();
    const trackCode = `${artistString}-${titleString}`;

    if (trackCode === "sabrina carpenter-espresso") return EspressoLike;
    if (artistString === "bad bunny") return BadBunnyLike;

    return DefaultLike;
};

export const HeartIcon = ({ liked, onClick, track, className }) => {
    const SpecificLikeComponent = getSpecificLikeComponent(track);

    return (
        <Suspense fallback={<DefaultLike liked={liked} onClick={onClick} className={className} />}>
            <SpecificLikeComponent
                liked={liked}
                onClick={onClick}
                className={className}
            />
        </Suspense>
    );
};
