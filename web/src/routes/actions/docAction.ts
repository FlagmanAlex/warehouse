import { redirect } from "react-router-dom";
import { fetchApi } from "../../api/fetchApi";
import { dtoItemToDocItem, dtoToDoc } from "../../api/mappers/docMappers";
import type { DocFormData } from "../../types/forms/DocForm";
import { formatDate } from "../../utils/formatDate";

export const docAction = async ({ request }: { request: Request }) => {
  const formData : any = await request.formData();

  // Безопасное извлечение и парсинг данных
  const docStr = formData.get('doc');
  const itemsStr = formData.get('items');
  const id = formData.get('id');
  const _method = formData.get('_method');


  if (typeof docStr !== 'string') {
    return { error: 'Не правильные данные документа' };
  }

  
  let docData, itemsData;
  try {
    docData = JSON.parse(docStr);
    itemsData = JSON.parse(itemsStr);
  } catch (error) {
    return { error: (error as Error).message || 'Неизвестная ошибка' };
  }

  if (!docData.customerId) {
    return { error: 'Выберите клиента' };
  }

  const docFormData: DocFormData = {
    doc: { ...docData, docDate: formatDate(new Date(docData.docDate))},
    items: itemsData,
  };

  console.log(docFormData);
  

  try {

    if (_method === 'DELETE') {
      await fetchApi(`doc/${id}`, 'DELETE');
      return redirect('/docs');
    }
    const domainDoc = dtoToDoc(docFormData.doc);
    const domainItems = docFormData.items.map(dtoItemToDocItem);

    switch (_method) {
      case 'PATCH':
          await fetchApi(`doc/${id}`, 'PATCH', { doc: domainDoc, items: domainItems });
          return redirect('/docs');
      case 'POST':
          await fetchApi('doc', 'POST', { doc: domainDoc, items: domainItems });
          return redirect('/docs');
      // default:
      //   return { error: 'Неверный метод' };
      }
  } catch (error) {
    console.error('Ошибка при сохранении документа:', error);
    return { error: (error as Error).message || 'Неизвестная ошибка' };
  }
};