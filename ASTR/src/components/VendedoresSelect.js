import React, { useState } from 'react';
import { View, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { Button } from 'react-native-elements';

const VendedoresSelect = (props) => {
  const { configuracion, setConfiguracion } = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Presione Buscar', value: '1234' }
  ]);

  const handleBuscarVendedores = async () => {
    console.log('Trayendo Vendedores...');
    let endPointVendedores = configuracion.endPoint + 'vendedores';
    try {
      const { data } = await axios.get(endPointVendedores);
      setItems(
        data.map((vendedor) => ({
          label: vendedor.descripcion,
          value: vendedor.codigo,
        }))
      );
    } catch (error) {
      console.error(error);
    }
    
  };

  const handleValueChange = (item) => {
    console.log(item);
    setConfiguracion({ ...configuracion, vendedor: item})
  };


  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          style={styles.picker}
          placeholder="Seleccione un vendedor"
          placeholderStyle={styles.placeholderStyle}
          onChangeValue={handleValueChange}   
        />
        <Button 
          title="Buscar" 
          onPress={handleBuscarVendedores} 
          buttonStyle={styles.buttonVendedores} 
        />
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "relative",
  },
  pickerContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: "baseline",
    margin: 5,
  },
  picker: {
    width: '90%',
  },
  buttonVendedores: {
    // marginRight: 30,
  },
  placeholderStyle: {
    color: '#999',
  },
});
export default VendedoresSelect;
