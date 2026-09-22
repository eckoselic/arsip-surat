import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Surat } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  kop: {
    width: "100%",
    marginBottom: 14,
  },
  title: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 12,
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#e5e5e5",
    borderStyle: "solid",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  cell: {
    borderStyle: "solid",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  colNo: { width: "4%" },
  colJenis: { width: "8%" },
  colNomor: { width: "13%" },
  colTanggal: { width: "9%" },
  colPerihal: { width: "22%" },
  colPihak: { width: "16%" },
  colKategori: { width: "10%" },
  colDisposisi: { width: "18%", borderRightWidth: 0 },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBlock: {
    width: 220,
    textAlign: "center",
  },
  signatureSpace: {
    height: 50,
  },
  printedAt: {
    marginTop: 16,
    fontSize: 8,
    color: "#555",
  },
});

function formatTanggal(tanggal: string | null): string {
  if (!tanggal) return "-";
  const d = new Date(tanggal);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  data: Surat[];
  periodeLabel: string;
  kopSuratBase64: string; // data URI lengkap: "data:image/png;base64,...."
  dicetakOleh: string; // "Admin TU" atau "Kepala Sekolah"
}

export function RekapPdfDocument({
  data,
  periodeLabel,
  kopSuratBase64,
  dicetakOleh,
}: Props) {
  const now = new Date().toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Image src={kopSuratBase64} style={styles.kop} />
        <Text style={styles.title}>
          REKAPITULASI ARSIP SURAT MASUK DAN KELUAR
        </Text>
        <Text style={styles.subtitle}>{periodeLabel}</Text>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, styles.colNo]}>No</Text>
            <Text style={[styles.headerCell, styles.colJenis]}>Jenis</Text>
            <Text style={[styles.headerCell, styles.colNomor]}>Nomor Surat</Text>
            <Text style={[styles.headerCell, styles.colTanggal]}>Tanggal</Text>
            <Text style={[styles.headerCell, styles.colPerihal]}>Perihal</Text>
            <Text style={[styles.headerCell, styles.colPihak]}>Pengirim/Tujuan</Text>
            <Text style={[styles.headerCell, styles.colKategori]}>Kategori</Text>
            <Text style={[styles.headerCell, styles.colDisposisi]}>Disposisi</Text>
          </View>

          {data.map((s, i) => (
            <View style={styles.row} key={s.id} wrap={false}>
              <Text style={[styles.cell, styles.colNo]}>{i + 1}</Text>
              <Text style={[styles.cell, styles.colJenis]}>
                {s.jenis === "masuk" ? "Masuk" : "Keluar"}
              </Text>
              <Text style={[styles.cell, styles.colNomor]}>{s.nomor_surat}</Text>
              <Text style={[styles.cell, styles.colTanggal]}>
                {formatTanggal(s.tanggal_surat)}
              </Text>
              <Text style={[styles.cell, styles.colPerihal]}>{s.perihal}</Text>
              <Text style={[styles.cell, styles.colPihak]}>{s.pengirim_tujuan}</Text>
              <Text style={[styles.cell, styles.colKategori]}>{s.kategori}</Text>
              <Text style={[styles.cell, styles.colDisposisi]}>
                {s.disposisi_status === "sudah"
                  ? `${s.disposisi_untuk ?? "-"}: ${s.disposisi_catatan ?? "-"}`
                  : "Belum didisposisi"}
              </Text>
            </View>
          ))}

          {data.length === 0 && (
            <View style={styles.row}>
              <Text style={[styles.cell, { width: "100%", textAlign: "center" }]}>
                Tidak ada data surat pada periode ini.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.signatureBlock}>
            <Text>Mengetahui,</Text>
            <Text>Kepala Sekolah</Text>
            <View style={styles.signatureSpace} />
            <Text>(_________________________)</Text>
          </View>
        </View>

        <Text style={styles.printedAt}>
          Dicetak oleh {dicetakOleh} pada {now}
        </Text>
      </Page>
    </Document>
  );
}
