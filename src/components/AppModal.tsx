import React, { useEffect, useState } from 'react';
import { Modal as RNModal, Platform, ModalProps, View, StyleSheet } from 'react-native';

// Dynamically import react-dom only on the web
let ReactDOM: any;
if (Platform.OS === 'web') {
  ReactDOM = require('react-dom');
}

export const AppModal: React.FC<ModalProps> = (props) => {
  if (Platform.OS === 'web') {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    // If modal is not visible or not yet mounted on client, render nothing
    if (!props.visible || !mounted) return null;

    const rootElement = document.getElementById('web-modal-root');
    
    // Fallback if the root isn't found (shouldn't happen in our setup)
    if (!rootElement) {
       return (
         <View style={[StyleSheet.absoluteFill, { zIndex: 99999, position: 'fixed' as any }]}>
           {props.children}
         </View>
       );
    }

    // Portal the modal contents precisely into the #web-modal-root element
    return ReactDOM.createPortal(
      <View style={[StyleSheet.absoluteFill, { zIndex: 99999, position: 'absolute' as any }]}>
        {props.children}
      </View>,
      rootElement
    );
  }

  // On Native, use standard React Native Modal
  return <RNModal {...props} />;
};
