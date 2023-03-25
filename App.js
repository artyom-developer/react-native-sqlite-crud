import { useState, useEffect } from "react";
import { 
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

function openDatabase() {  
  const db = SQLite.openDatabase("test4.db");
  return db;
}

const db = openDatabase();
 

export default function App() { 

  const [items, setItems] = useState([]);
  const [ showForm, setShowForm ] = useState(false);
  const [ formData, setFormData ] = useState({
    id: 0, name: "Juan", address: "Cll 100", phone: 319028484
  });

  const [forceUpdate, forceUpdateId] = useForceUpdate();

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, name text, address text, phone int);"
      );
      reloadData(tx)
    });
  }, []);

  const reloadData = (tx) => {
    tx.executeSql( `select * from items;`, [ ],
      (_, { rows: { _array } }) => setItems(_array)
    );
  }

  const register = () => {
    
      db.transaction(
        (tx) => {
          if(formData.id==0){
            tx.executeSql("insert into items (name, address, phone) values ( ?, ?, ?)", [
              formData.name, formData.address, formData.phone
            ]);
          }
          else{
            console.log('Parametro form ',formData)
            tx.executeSql(`update items set name = ?, address = ?, phone = ? where id = ?;`, [
              formData.name, 
              formData.address, 
              formData.phone, 
              formData.id
            ]);
          }
          reloadData(tx);
        },
        (error) => console.log('jr tx error', error),
        forceUpdate
      );

      setShowForm(false);
  
  };

  const onClickDelete = (id) => {

    db.transaction(
      (tx) => {
        tx.executeSql(`delete from items where id = ?;`, [id]);
        reloadData(tx)
      },
      null,
      forceUpdate
    )

  }

  const edit = (data) => {
    setFormData(data);
    setShowForm(true);
  } 

  const add = () => {
    setShowForm(true);                
    setFormData({ ...formData, 'id': 0})
  } 
  
  return (
    <View style={styles.container}>
      <View style={{height:20}} />
      <Text style={styles.heading}>SQLite CRUD Sample 2</Text>
  
        <>

          {
            showForm?
            <View style={{ padding: 20 }}>

              <TextInput
                onChangeText={(text) => setFormData({ ...formData, 'name': text  })} 
                placeholder="Jhon Doe"
                style={styles.input}
                value={formData.name}
              /> 

              <TextInput
                onChangeText={(text) => setFormData({ ...formData, 'address': text  })} 
                placeholder="Cll 100"
                maxLength={100}
                style={styles.input}
                value={formData.address}
              /> 

              <TextInput
                onChangeText={(text) => setFormData({ ...formData, 'phone': text  })} 
                placeholder="300000000"
                maxLength={10}
                style={styles.input}
                value={formData.phone+""}
                inputMode={"numeric"}
              /> 

              <Button onPress={register} title="Save" color="#2E4053"  />
            </View>
            :
            <View style={{ padding: 20 }}>
              <Button onPress={()=>add()} title="New" color="#2E4053" />
            </View>
          }
          <ScrollView style={styles.listArea}>
 

            <View style={styles.sectionContainer}>
              
              {items.map(({ id, name, address, phone }) => (
                <TouchableOpacity
                  key={id}
                  //onPress={() =>  onClickDelete(id)}
                  onPress={() =>  edit({id, name, address, phone})}
                  style={{
                    backgroundColor:   "#1c9963" ,
                    borderColor: "#000",
                    borderWidth: 1,
                    padding: 8,
                  }}
                >
                  <Text style={{ color:  "#000" }}>{id}- {name}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </>
     
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#2E4053",
    backgroundColor:"#F8F9F9",
    borderRadius: 6,
    borderWidth: 1, 
    marginBottom: 16,
    padding: 8, 
  }, 
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});