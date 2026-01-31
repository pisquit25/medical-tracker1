import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateAge } from './patientUtils';

export const generatePatientPDF = (patient, measurements, parameters, visits = []) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Report Medico Paziente', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 30);
  
  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Dati Paziente
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Dati Paziente', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  const age = calculateAge(patient.dataNascita);
  
  doc.text(`Nome: ${patient.nome} ${patient.cognome}`, 14, yPos);
  yPos += 6;
  doc.text(`Codice Fiscale: ${patient.codiceFiscale}`, 14, yPos);
  yPos += 6;
  doc.text(`Data di Nascita: ${new Date(patient.dataNascita).toLocaleDateString('it-IT')} (${age} anni)`, 14, yPos);
  yPos += 6;
  doc.text(`Sesso: ${patient.sesso === 'M' ? 'Maschio' : 'Femmina'}`, 14, yPos);
  yPos += 6;
  
  if (patient.email) {
    doc.text(`Email: ${patient.email}`, 14, yPos);
    yPos += 6;
  }
  if (patient.telefono) {
    doc.text(`Telefono: ${patient.telefono}`, 14, yPos);
    yPos += 6;
  }
  
  if (patient.tags && patient.tags.length > 0) {
    doc.text(`Patologie: ${patient.tags.join(', ')}`, 14, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Note Mediche
  if (patient.allergie || patient.terapie || patient.note) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Informazioni Cliniche', 14, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    if (patient.allergie) {
      doc.text(`Allergie: ${patient.allergie}`, 14, yPos);
      yPos += 6;
    }
    if (patient.terapie) {
      doc.text(`Terapie in corso: ${patient.terapie}`, 14, yPos);
      yPos += 6;
    }
    if (patient.note) {
      doc.text(`Note: ${patient.note}`, 14, yPos);
      yPos += 6;
    }
    
    yPos += 5;
  }

  // Riepilogo Statistiche
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Riepilogo', 14, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  doc.text(`Totale Misurazioni: ${measurements.length}`, 14, yPos);
  yPos += 6;
  
  if (patient.lastVisit) {
    doc.text(`Ultima Visita: ${new Date(patient.lastVisit).toLocaleDateString('it-IT')}`, 14, yPos);
    yPos += 6;
  }
  
  const uniqueParameters = [...new Set(measurements.map(m => m.parameter))];
  doc.text(`Parametri Monitorati: ${uniqueParameters.length} (${uniqueParameters.join(', ')})`, 14, yPos);
  yPos += 10;

  // Tabella Misurazioni
  if (measurements.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Storico Misurazioni', 14, yPos);
    yPos += 10;

    // Raggruppa per parametro
    const measurementsByParam = {};
    measurements.forEach(m => {
      if (!measurementsByParam[m.parameter]) {
        measurementsByParam[m.parameter] = [];
      }
      measurementsByParam[m.parameter].push(m);
    });

    Object.entries(measurementsByParam).forEach(([paramName, paramMeasurements]) => {
      const param = parameters.find(p => p.name === paramName);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(paramName, 14, yPos);
      yPos += 5;

      const tableData = paramMeasurements
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20) // Ultime 20 misurazioni per parametro
        .map(m => [
          new Date(m.date).toLocaleDateString('it-IT'),
          `${m.value.toFixed(2)} ${param?.unit || ''}`,
          m.notes || '-',
          m.includedInFormula ? 'Sì' : 'No'
        ]);

      doc.autoTable({
        startY: yPos,
        head: [['Data', 'Valore', 'Note', 'In Formula']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
        didDrawPage: function (data) {
          yPos = data.cursor.y + 10;
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  // Storico Visite
  if (visits && visits.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 10;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Storico Visite', 14, yPos);
    yPos += 10;

    const visitData = visits
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(v => [
        new Date(v.date).toLocaleDateString('it-IT'),
        v.motivo || '-',
        v.note ? v.note.substring(0, 50) + '...' : '-'
      ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data', 'Motivo', 'Note']],
      body: visitData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Pagina ${i} di ${pageCount} - Medical Tracker - Report generato il ${new Date().toLocaleDateString('it-IT')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Salva PDF
  const fileName = `${patient.cognome}_${patient.nome}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default generatePatientPDF;
