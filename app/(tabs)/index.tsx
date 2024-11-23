import { StyleSheet } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  BottomSheet,
  BottomSheetNativeComponent,
} from "@/modules/bottom-sheet";
import {
  BottomSheetSnapPoint,
  BottomSheetSnapPointChangeEvent,
  BottomSheetStateChangeEvent,
} from "@/modules/bottom-sheet/src/BottomSheet.types";
import { useDialogStateControlContext } from "@/context/bottomSheetContext";
import { Context } from "@/components/Dialog/context";

interface TabOneScreenProps {
  control: any;
  onClose?: () => void;
  testID?: string;
}

export default function TabOneScreen({
  control,
  onClose,
  testID,
}: TabOneScreenProps) {
  const [disableDrag, setDisableDrag] = useState(false);
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>(
    BottomSheetSnapPoint.Partial
  );

  const { setDialogIsOpen, setFullyExpandedCount } =
    useDialogStateControlContext();

  const ref = useRef<BottomSheetNativeComponent>(null);
  const closeCallbacks = useRef<(() => void)[]>([]);
  const prevSnapPoint = useRef<BottomSheetSnapPoint>(
    BottomSheetSnapPoint.Hidden
  );

  const callQueuedCallbacks = useCallback(() => {
    for (const cb of closeCallbacks.current) {
      try {
        cb();
      } catch (e: any) {
        console.error(e || "Error running close callback");
      }
    }

    closeCallbacks.current = [];
  }, []);

  // This is the actual thing we are doing once we "confirm" the dialog. We want the dialog's close animation to
  // happen before we run this. It is passed to the `BottomSheet` component.
  const onCloseAnimationComplete = useCallback(() => {
    // This removes the dialog from our list of stored dialogs. Not super necessary on iOS, but on Android this
    // tells us that we need to toggle the accessibility overlay setting
    setDialogIsOpen(control.id, false);
    callQueuedCallbacks();
    onClose?.();
  }, [callQueuedCallbacks, control.id, onClose, setDialogIsOpen]);

  const onSnapPointChange = (e: BottomSheetSnapPointChangeEvent) => {
    const { snapPoint } = e.nativeEvent;
    setSnapPoint(snapPoint);

    if (
      snapPoint === BottomSheetSnapPoint.Full &&
      prevSnapPoint.current !== BottomSheetSnapPoint.Full
    ) {
      setFullyExpandedCount((c) => c + 1);
    } else if (
      snapPoint !== BottomSheetSnapPoint.Full &&
      prevSnapPoint.current === BottomSheetSnapPoint.Full
    ) {
      setFullyExpandedCount((c) => c - 1);
    }
    prevSnapPoint.current = snapPoint;
  };

  const onStateChange = (e: BottomSheetStateChangeEvent) => {
    if (e.nativeEvent.state === "closed") {
      onCloseAnimationComplete();

      if (prevSnapPoint.current === BottomSheetSnapPoint.Full) {
        setFullyExpandedCount((c) => c - 1);
      }
      prevSnapPoint.current = BottomSheetSnapPoint.Hidden;
    }
  };

  const context = useMemo(
    () => ({
      close,
      isNativeDialog: true,
      nativeSnapPoint: snapPoint,
      disableDrag,
      setDisableDrag,
    }),
    [close, snapPoint, disableDrag, setDisableDrag]
  );

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={ref}
        cornerRadius={20}
        backgroundColor={"white"}
        onSnapPointChange={onSnapPointChange}
        onStateChange={onStateChange}
        disableDrag={disableDrag}
      >
        <Context.Provider value={context}>
          <View testID={testID}>
            <Text style={styles.title}>Tab One</Text>
            <View
              style={styles.separator}
              lightColor="#eee"
              darkColor="rgba(255,255,255,0.1)"
            />
          </View>
        </Context.Provider>
      </BottomSheet>
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
