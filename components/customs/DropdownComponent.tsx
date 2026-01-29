import { useThemeColor } from '@/hooks/use-theme-color';
import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

interface DropdownComponentProps {
    data: { label: string; value: string }[];
    value: string | null;
    placeholder?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export type DropdownProps =
    ThemedViewProps &
    DropdownComponentProps;

const DropdownComponent = ({
    data,
    value,
    onChange,
    placeholder = "Chọn...",
    lightColor,
    darkColor,
    disabled,
}: DropdownProps) => {
    const borderColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "border"
    );
    const renderItem = (item: any) => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
                {item.value === value && (
                    <AntDesign
                        style={styles.icon}
                        color="black"
                        name="check"
                        size={20}
                    />
                )}
            </View>
        );
    };

    return (
        <Dropdown
            style={[
                styles.dropdown,
                { borderColor },
                disabled && { opacity: 0.5 },
            ]}
            disable={disabled}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            searchPlaceholder="Tìm kiếm..."
            value={value}
            onChange={(item: any) => {
                onChange(item.value);
            }}
            renderItem={renderItem}
        />
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    dropdown: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        height: 40,
    },
    icon: {
        marginRight: 5,
    },
    item: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 16,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});