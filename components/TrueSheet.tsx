import React, {
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  ReactNode,
} from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { NAV_THEME } from '@/constants';

interface TrueSheetProps {
  handleSheetChanges?:any,
  snapPoint?: any,
  children: ReactNode; // Children components to render inside the sheet
}

const TrueSheet = forwardRef<any, TrueSheetProps>(({ children, snapPoint, handleSheetChanges }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for BottomSheet
  const snapPoints = snapPoint;

  // Handle methods exposed to parent
  useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    close: () => bottomSheetRef.current?.close(),
  }));

  // Callbacks
  const renderBackDrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
    ),
    []
  );


  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1}
      enablePanDownToClose={true}
      enableContentPanningGesture={true}
      backdropComponent={renderBackDrop}
      onChange={handleSheetChanges}
      handleIndicatorStyle={{ backgroundColor: NAV_THEME.dark.text }}
      backgroundStyle={{ backgroundColor: NAV_THEME.dark.background }}
    >
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </BottomSheet>
  );
});

TrueSheet.displayName = 'TrueSheet';

export default TrueSheet;
