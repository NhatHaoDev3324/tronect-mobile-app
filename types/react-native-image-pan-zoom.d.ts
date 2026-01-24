declare module 'react-native-image-pan-zoom' {
    import { Component } from 'react';

    interface ImageZoomProps {
        cropWidth: number;
        cropHeight: number;
        imageWidth: number;
        imageHeight: number;
        children?: React.ReactNode;
    }

    export default class ImageZoom extends Component<ImageZoomProps> { }
}
