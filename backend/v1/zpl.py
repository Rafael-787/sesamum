def generate_zpl_label(name: str, company: str = "Staff", qr_data: str = "", event:str = "") -> str:
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
        "^POI" # Inverte a impressão para começar na ponta de saída
        "^PW200"           # Largura (25mm)
        "^LL2344"           # Altura (289mm)
        f"^FO120,640^A0R,40,40^FD{display_name}^FS"
        f"^FO80,640^A0R,30,30^FD{company}^FS"
        f"^FO40,640^A0R,30,30^FD{event}^FS"
        f"^FO10,440^BQN,2,6^FDQA,{qr_data}^FS"
        "^XZ"
    )

    return zpl