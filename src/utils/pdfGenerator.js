import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateAge } from './patientUtils';
import { calculateSetpoint } from './setpointCalculator';

// Funzione helper per determinare colore semaforo
const getTrafficLightColor = (value, standardRange, customRange) => {
  const inStandardRange = standardRange && 
    value >= standardRange.min && value <= standardRange.max;
  
  const inCustomRange = customRange && 
    value >= customRange.min && value <= customRange.max;
  
  // Verde: dentro entrambi i range
  if (inStandardRange && inCustomRange) {
    return [34, 197, 94]; // green-500
  }
  // Giallo: dentro un solo range
  if (inStandardRange || inCustomRange) {
    return [234, 179, 8]; // yellow-500
  }
  // Rosso: fuori da entrambi
  return [239, 68, 68]; // red-500
};

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

      // Calcola SETPOINT (Robust o GMM) invece di media semplice
      let customRange = null;
      let setpointInfo = null;
      
      const setpointResult = calculateSetpoint(paramMeasurements);
      
      if (setpointResult && !setpointResult.error) {
        const { setpoint, std, methodUsed } = setpointResult;
        
        // Determina multiplier dalla formula
        const multiplier = param?.customFormula?.includes('2*sd') ? 2 : 1.5;
        
        customRange = {
          min: setpoint - multiplier * std,
          max: setpoint + multiplier * std
        };
        
        setpointInfo = {
          value: setpoint,
          method: methodUsed === 'gmm' ? 'GMM' : 'Robust IQR',
          std: std
        };
      }

      const tableData = paramMeasurements
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20) // Ultime 20 misurazioni per parametro
        .map(m => {
          const value = m.value;
          const standardRange = param?.standardRange;
          
          // Check range standard
          let inStandardRange = '-';
          if (standardRange) {
            inStandardRange = (value >= standardRange.min && value <= standardRange.max) ? '✓ SÌ' : '✗ NO';
          }
          
          // Check range personalizzato
          let inCustomRange = '-';
          if (customRange) {
            inCustomRange = (value >= customRange.min && value <= customRange.max) ? '✓ SÌ' : '✗ NO';
          }
          
          return [
            new Date(m.date).toLocaleDateString('it-IT'),
            `${m.value.toFixed(2)} ${param?.unit || ''}`,
            inStandardRange,
            inCustomRange,
            m.notes || '-',
            m.includedInFormula ? 'Sì' : 'No'
          ];
        });

      doc.autoTable({
        startY: yPos,
        head: [['Data', 'Valore', 'Range Std', 'Range Pers', 'Note', 'In Formula']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 22 },  // Data
          1: { cellWidth: 28 },  // Valore
          2: { cellWidth: 22 },  // Range Std
          3: { cellWidth: 22 },  // Range Pers
          4: { cellWidth: 50 },  // Note
          5: { cellWidth: 20 }   // In Formula
        },
        // NUOVO: Colori semaforo per i valori
        didParseCell: function(data) {
          // Colora la colonna "Valore" (index 1)
          if (data.section === 'body' && data.column.index === 1) {
            const rowIndex = data.row.index;
            const measurement = paramMeasurements
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 20)[rowIndex];
            
            if (measurement) {
              const color = getTrafficLightColor(
                measurement.value,
                param?.standardRange,
                customRange
              );
              
              data.cell.styles.fillColor = color;
              data.cell.styles.textColor = [255, 255, 255]; // Testo bianco
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawPage: function (data) {
          yPos = data.cursor.y + 10;
        }
      });

      yPos = doc.lastAutoTable.finalY + 5;
      
      // NUOVO: Legenda Semaforo e Info Setpoint
      if (setpointInfo || param?.standardRange || customRange) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Legenda:', 14, yPos);
        yPos += 5;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        
        // Legenda colori
        const legendY = yPos;
        
        // Verde
        doc.setFillColor(34, 197, 94);
        doc.rect(14, legendY, 3, 3, 'F');
        doc.text('Ottimale (in entrambi i range)', 20, legendY + 2.5);
        
        // Giallo
        doc.setFillColor(234, 179, 8);
        doc.rect(80, legendY, 3, 3, 'F');
        doc.text('Attenzione (in un solo range)', 86, legendY + 2.5);
        
        // Rosso
        doc.setFillColor(239, 68, 68);
        doc.rect(145, legendY, 3, 3, 'F');
        doc.text('Critico (fuori range)', 151, legendY + 2.5);
        
        yPos += 8;
        
        // Info Range Personalizzato (Setpoint)
        if (customRange && setpointInfo) {
          doc.setFont(undefined, 'bold');
          doc.text(`Range Personalizzato (${setpointInfo.method}):`, 14, yPos);
          doc.setFont(undefined, 'normal');
          doc.text(
            `${customRange.min.toFixed(2)} - ${customRange.max.toFixed(2)} ${param?.unit || ''} (Setpoint: ${setpointInfo.value.toFixed(2)} ± ${setpointInfo.std.toFixed(2)})`,
            14, yPos + 4
          );
          yPos += 8;
        }
        
        if (param?.standardRange) {
          doc.setFont(undefined, 'bold');
          doc.text('Range Standard:', 14, yPos);
          doc.setFont(undefined, 'normal');
          doc.text(
            `${param.standardRange.min} - ${param.standardRange.max} ${param.unit}`,
            14, yPos + 4
          );
          yPos += 8;
        }
      }
      
      yPos += 7;
      
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
