def removeXmlHeaderAndWrapper(String xmlContent) {
    // Remove XML declaration
    def contentWithoutHeader = xmlContent.replaceFirst(/<\?xml[^>]*\?>/, '')
    
    // Remove Interchange wrapper
    contentWithoutHeader = contentWithoutHeader.replaceFirst(/<ns0:Interchange[^>]*>/, '')
    contentWithoutHeader = contentWithoutHeader.replaceFirst(/<\/ns0:Interchange>/, '')
    
    return contentWithoutHeader.trim()
}

// Example usage:
def xmlContent = '''<?xml version="1.0" encoding="UTF-8"?><ns0:Interchange xmlns:ns0="urn:sap.com:typesystem:b2b:6:un-edifact">
<S_UNA>:+.? '</S_UNA>
<S_UNB>
<C_S001>
<D_0001>UNOC</D_0001>
<D_0002>3</D_0002>
</C_S001>
<C_S002>
<D_0004>SP_Splt_MMT_OWN_MSB_E</D_0004>
<D_0007>500</D_0007>
</C_S002>
<C_S003>
<D_0010>SP_Splt_MMT_EXT_MSB_E</D_0010>
<D_0007>500</D_0007>
</C_S003>
<C_S004>
<D_0017>251120</D_0017>
<D_0019>0243</D_0019>
</C_S004>
<D_0020>RT34DFB255F749</D_0020>
</S_UNB>
<M_APERAK>
<S_UNH>
<D_0062>11000001786451</D_0062>
<C_S009>
<D_0065>APERAK</D_0065>
<D_0052>D</D_0052>
<D_0054>07B</D_0054>
<D_0051>UN</D_0051>
<D_0057>2.1i</D_0057>
</C_S009>
</S_UNH>
<S_BGM>
<C_C002>
<D_1001>314</D_1001>
</C_C002>
<C_C106>
<D_1004>BGM0001786451</D_1004>
</C_C106>
</S_BGM>
<S_DTM>
<C_C507>
<D_2005>137</D_2005>
<D_2380>202411200243+00</D_2380>
<D_2379>303</D_2379>
</C_C507>
</S_DTM>
<G_SG2>
<S_RFF>
<C_C506>
<D_1153>ACE</D_1153>
<D_1154>11000001786411</D_1154>
</C_C506>
</S_RFF>
<S_DTM>
<C_C507>
<D_2005>171</D_2005>
<D_2380>202411190352+00</D_2380>
<D_2379>303</D_2379>
</C_C507>
</S_DTM>
</G_SG2>
<G_SG3>
<S_NAD>
<D_3035>MS</D_3035>
<C_C082>
<D_3039>SP_Splt_MMT_OWN_MSB_E</D_3039>
<D_3055>293</D_3055>
</C_C082>
</S_NAD>
</G_SG3>
<G_SG3>
<S_NAD>
<D_3035>MR</D_3035>
<C_C082>
<D_3039>SP_Splt_MMT_EXT_MSB_E</D_3039>
<D_3055>293</D_3055>
</C_C082>
</S_NAD>
</G_SG3>
<G_SG4>
<S_ERC>
<C_C901>
<D_9321>Z18</D_9321>
</C_C901>
</S_ERC>
<G_SG5>
<S_RFF>
<C_C506>
<D_1153>ACW</D_1153>
<D_1154>11000001786411</D_1154>
</C_C506>
</S_RFF>
</G_SG5>
<G_SG5>
<S_RFF>
<C_C506>
<D_1153>AGO</D_1153>
<D_1154>11000001786411</D_1154>
</C_C506>
</S_RFF>
</G_SG5>
<G_SG5>
<S_RFF>
<C_C506>
<D_1153>TN</D_1153>
<D_1154>4773F5099E161EEFA9C534F4C9A790F2</D_1154>
</C_C506>
</S_RFF>
</G_SG5>
</G_SG4>
<S_UNT>
<D_0074>12</D_0074>
<D_0062>11000001786451</D_0062>
</S_UNT>
</M_APERAK>
<S_UNZ>
<D_0036>1</D_0036>
<D_0020>RT34DFB255F749</D_0020>
</S_UNZ>
</ns0:Interchange>'''

def result = removeXmlHeaderAndWrapper(xmlContent)
println result 