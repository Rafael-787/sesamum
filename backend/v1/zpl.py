def generate_zpl_label(name: str, company: str = "Staff", qr_data: str = "") -> str:
    """
    Gera os comandos ZPL para impressão da pulseira/etiqueta.
    ^XA e ^XZ abrem e fecham o formato.
    ^FO = Coordenadas X,Y
    ^A0N = Fonte e tamanho
    ^BQN = QR Code
    """
    # Limita o tamanho do nome se for muito grande para não cortar a pulseira
    display_name = name[:25] 

    zpl = (
        "^XA"
        #"^PW640"           # Largura (80mm)
        #"^LL200"           # Altura (25mm)
        f"^FO120,600^A0R,40,40^FD{display_name}^FS"
        f"^FO80,600^A0R,30,30^FD{company}^FS"
        f"^FO10,400^BQN,2,6^FDQA,{qr_data}^FS"
        "^XZ"
    )

    return zpl