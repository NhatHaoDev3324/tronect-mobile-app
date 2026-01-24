import { GLView } from "expo-gl";
import { Renderer, loadAsync } from "expo-three";
import { useRef } from "react";
import { PanResponder } from "react-native";
import * as THREE from "three";

export function Panorama360View({ imageUrl }: { imageUrl: string }) {
    const meshRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const MIN_FOV = 60;
    const MAX_FOV = 120;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, g) => {
            if (!meshRef.current || !cameraRef.current) return;

            if (evt.nativeEvent.touches.length === 2) {
                const [t1, t2] = evt.nativeEvent.touches;

                const dx = t1.pageX - t2.pageX;
                const dy = t1.pageY - t2.pageY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if ((panResponder as any).lastDistance) {
                    const delta = distance - (panResponder as any).lastDistance;

                    cameraRef.current.fov -= delta * 0.05;
                    cameraRef.current.fov = Math.max(
                        MIN_FOV,
                        Math.min(MAX_FOV, cameraRef.current.fov)
                    );
                    cameraRef.current.updateProjectionMatrix();
                }

                (panResponder as any).lastDistance = distance;
                return;
            }

            meshRef.current.rotation.y += g.dx * 0.0002;
            meshRef.current.rotation.x += g.dy * 0.0002;

            meshRef.current.rotation.x = Math.max(
                -Math.PI / 2,
                Math.min(Math.PI / 2, meshRef.current.rotation.x)
            );
        },
        onPanResponderRelease: () => {
            (panResponder as any).lastDistance = null;
        },
    });

    const onContextCreate = async (gl: any) => {
        const renderer = new Renderer({ gl }) as any;
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            80,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            2000
        );
        camera.position.set(0, 0, 0.01);
        cameraRef.current = camera;

        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const texture = await loadAsync(imageUrl, renderer);
        const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ map: texture })
        );

        meshRef.current = mesh;
        scene.add(mesh);

        const render = () => {
            renderer.render(scene, camera);
            gl.endFrameEXP();
            requestAnimationFrame(render);
        };

        render();
    };

    return (
        <GLView
            style={{ flex: 1, backgroundColor: "black" }}
            onContextCreate={onContextCreate}
            {...panResponder.panHandlers}
        />
    );
}
