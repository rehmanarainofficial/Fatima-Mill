import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import AppText from './AppText'
import { APPCOLORS } from '../utils/APPCOLORS'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { responsiveFontSize, responsiveHeight } from '../utils/Responsive'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'

const SimpleHeader = ({ title }) => {
      const nav = useNavigation()
    
    return (
        <LinearGradient colors={[APPCOLORS.Primary, APPCOLORS.Secondary]} style={{alignItems:'center', flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20, height:responsiveHeight(10), borderBottomRightRadius:20, borderBottomLeftRadius:20, paddingTop:10}}>
            <TouchableOpacity onPress={()=> nav.goBack()}>
                <Ionicons
                    name={"arrow-back"}
                    size={responsiveFontSize(3)}
                    color={APPCOLORS.WHITE}

                />
            </TouchableOpacity>

            <AppText title={title} titleColor={APPCOLORS.WHITE}  titleSize={3} titleWeight/>

             <TouchableOpacity onPress={()=> nav.navigate("Dashboard")}>
                <Ionicons
                    name={"person"}
                    size={responsiveFontSize(3)}
                    color={APPCOLORS.WHITE}

                />
            </TouchableOpacity>
        </LinearGradient>
    )
}

export default SimpleHeader