import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { APPCOLORS } from '../utils/APPCOLORS'
import AppText from './AppText'
import { AppImages } from '../assets/images/AppImages'
import { responsiveHeight } from '../utils/Responsive'
import { useNavigation } from '@react-navigation/native'
import BaseUrl from '../utils/BaseUrl'
import moment from 'moment'
import axios from 'axios'

const AlertCards = ({ HeadingOne, HeadingThree, HeadingTwo, ValueOne, ValueThree, ValueTwo, AlertHeading, onValuePressOne,onValuePressTwo, onValuePressThree,}: props) => {
    const nav = useNavigation()

    return (
        <View style={{ backgroundColor: APPCOLORS.WHITE, borderBottomRightRadius: 20, borderBottomLeftRadius: 20, shadowRadius: 2, elevation: 2 }}>
            <LinearGradient colors={["#0784B5", "#033A4F"]} style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                <AppText title={AlertHeading} titleColor={APPCOLORS.WHITE} titleSize={2} titleWeight />
            </LinearGradient>

            <View style={{ padding: 20, gap: 20 }}>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Image source={AppImages.warning} style={{ height: responsiveHeight(3), width: responsiveHeight(3), resizeMode: 'contain' }} />
                        <AppText title={HeadingOne} titleSize={2} titleColor={APPCOLORS.BLACK} />
                    </View>

                    <TouchableOpacity onPress={onValuePressOne}>

                    <AppText title={ValueOne} titleSize={2} titleColor={APPCOLORS.BLACK} />
                    </TouchableOpacity>

                </View>



                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Image source={AppImages.delivery} style={{ height: responsiveHeight(3), width: responsiveHeight(3), resizeMode: 'contain' }} />
                        <AppText title={HeadingTwo} titleSize={2} titleColor={APPCOLORS.BLACK} />
                    </View>

                    <TouchableOpacity onPress={onValuePressTwo}>
                    <AppText title={ValueTwo} titleSize={2} titleColor={APPCOLORS.BLACK} />
                    </TouchableOpacity>

                </View>


                {
                    HeadingThree && (

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Image source={AppImages.bird} style={{ height: responsiveHeight(3), width: responsiveHeight(3), resizeMode: 'contain' }} />
                                <AppText title={HeadingThree} titleSize={2} titleColor={APPCOLORS.BLACK} />
                            </View>

                                                <TouchableOpacity onPress={onValuePressThree}>
                            <AppText title={ValueThree} titleSize={2} titleColor={APPCOLORS.BLACK} />
                                                </TouchableOpacity>

                        </View>
                    )
                }

            </View>

        </View>
    )
}

export default AlertCards
