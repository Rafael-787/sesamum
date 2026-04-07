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
        "^PW640"           # Largura (80mm)
        "^LL200"           # Altura (25mm)
        f"^FO200,40^A0N,40,40^FD{display_name}^FS"
        f"^FO200,100^A0N,30,30^FD{company}^FS"
        f"^FO30,30^BQN,2,5^FDQA,{qr_data}^FS"
        "^XZ"
    )

    return zpl