import { IDocItem } from "@warehouse/interfaces";
import { DocItemDto } from "@warehouse/interfaces/DTO";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

// Редактируемая позиция
export const EditableItem = ({ item, onUpdate }: { item: DocItemDto; onUpdate: (item: DocItemDto) => void }) => {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [price, setPrice] = useState(item.unitPrice.toString());
  const [bonusStock, setBonusStock] = useState<string>(item.bonusStock?.toString() || '');

  useEffect(() => {
    // const sum = parseFloat(quantity) * parseFloat(price);
    onUpdate({
      ...item,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(price),
      bonusStock: parseFloat(bonusStock),
      // sum: isNaN(sum) ? 0 : sum,
    });
  }, [quantity, price]);

  return (
    <View style={styles.itemRow}>
      <Text style={styles.productName}>{item.productId.name}</Text>
      <View style={styles.editRow}>
        <TextInput
          style={[styles.editInput, styles.flex1]}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.editInput, styles.flex1]}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.editInput, styles.flex1]}
          value={bonusStock}
          onChangeText={setBonusStock}
          keyboardType="numeric"
        />
        <Text style={[styles.editInput, styles.flex1]}>
          {(parseFloat(quantity) * (parseFloat(price) - parseFloat(bonusStock))).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  itemRow: { paddingVertical: 10 },
  productName: { fontSize: 16, fontWeight: '600', color: '#212121' },
  detailsRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  editRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  flex1: { flex: 1 },
});
